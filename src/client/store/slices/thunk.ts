import { createAsyncThunk } from "@reduxjs/toolkit";
import { bad, Reply } from "../../../shared/reply";
import { RootState } from "..";
import { SettingsData } from "../../../shared/settings";
import { TimeData } from "../../../shared/time";
import { TransformerFile } from "../../../shared/state/stores/TransformerStore";
import { Question } from "../../../shared/worker/response";
import { clearTransformerPage, getTransformerDraftAsData, getTransformerNames, getTransformerPageInfo, getValidTransformerFiles, setTransformerPage } from "./system";
import { pushError } from "./ui";
import { AdvancedTransformerDraft, SimpleTransformerDraft, TransformerDraft } from "./drafts";
import { CreateQuarterOptions } from "../../../shared/ipc/system/createQuarter";

/** ------------------------------------------------------------------------- */

const { invoke } = window.api;

export const pullAllQuarters = createAsyncThunk(
  'system/getAllQuarters',
  async (): Promise<Reply<TimeData[]>> => {
    return await invoke.getAllQuarters();
  }
);

export const pushSystemSettings = createAsyncThunk(
  'system/pushSettings',
  async (_, { getState }): Promise<Reply<string>> => {
    const { system } = getState() as RootState;
    const { directory } = system.draft.settings;
    if (directory == null) {
      return bad("No directory selected!");
    }

    const settings = { ...system.draft.settings, directory };
    return await invoke.setSettings(settings);
  }
);

export const pullSystemSettings = createAsyncThunk(
  'system/pullSettings',
  async (): Promise<Reply<SettingsData>> => {
    return await invoke.getSettings({});
  }
);

export const pullQuestions = createAsyncThunk(
  'system/pullQuestions',
  async (): Promise<Reply<Question[]>> => {
    return await invoke.getQuestions({});
  }
);

export const startSystem = createAsyncThunk(
  'system/start',
  async (_, { getState }) => {
    const { system } = getState() as RootState;
    const { time } = system.draft.context;
    if (time == null) return bad("No quarter selected!");

    return await invoke.runProgram({ ...system.draft.context, time });
  }
);

export const showOutputFile = createAsyncThunk(
  'system/showOutput',
  async (_, { getState }) => {
    const { system } = getState() as RootState;
    const { time } = system.draft.context;
    if (time == null) return bad("No quarter selected!");

    return await invoke.openOutputFile({ ...system.draft.context, time });
  }
);

export const killSystem = createAsyncThunk(
  'system/kill',
  async () => {
    return await invoke.cancelProgram({});
  }
);

export const pullTransformers = createAsyncThunk(
  'system/pullTransformers',
  async (): Promise<Reply<TransformerFile[]>> => {
    return await invoke.getTransformers();
  }
);

export const viewExistingTransformer = createAsyncThunk(
  'system/viewTransformer',
  async (name: string, { getState, dispatch }): Promise<void> => {
    const state = getState() as RootState;

    const valid = getValidTransformerFiles(state);
    const current = valid.find(f => f.item.name === name);
    if (current == null) {
      dispatch(clearTransformerPage());
      dispatch(pushError("Cannot find the transformer to edit!"));
      return;
    }

    if (!current.data.ok) {
      dispatch(clearTransformerPage());
      dispatch(pushError("Cannot edit malformed transformer!"));
      return;
    }

    let draft: TransformerDraft;

    switch (current.data.data.type) {
      case "advanced":
        draft = {
          type: "advanced",
          text: JSON.stringify(current.data.data, null, 2),
        };
        break;
      case "simple":
        draft = {
          ...current.data.data,
          source: {
            ...current.data.data.source,
            trim: {
              top: current.data.data.source.trim.top.toString(),
              bottom: current.data.data.source.trim.bottom.toString()
            }
          }
        }
        break;
    }

    dispatch(setTransformerPage({
      type: "update",
      meta: current.item,
      draft: draft,
    }));
  }
);

/** ------------------------------------------------------------------------- */

function generateAdvancedDraft(name: string): AdvancedTransformerDraft {
  return {
    type: "advanced",
    text: JSON.stringify({
      type: "advanced",
      name: name,
      tags: [],
      sources: [],
      requirements: [],
      preprocess: [],
      properties: [],
      postprocess: [],
      destination: []
    }, null, 2)
  }
}

function generateBasicDraft(name: string, group: string): SimpleTransformerDraft {
  return {
    type: 'simple',
    name: name,
    group: group,
    source: {
      sheets: [],
      file: undefined,
      trim: { 
        
      }
    },
    properties: {
      purchaseId: 'counter',
      transactionDate: {
        column: undefined,
        parse: undefined
      },
      supplierId: {
        value: undefined
      },
      memberId: {
        column: undefined
      },
      distributorName: {
        type: 'value',
        value: undefined
      },
      purchaseAmount: {
        column: undefined
      },
      rebateAmount: {
        column: undefined,
        multiplier: undefined
      },
      invoiceId: {
        column: undefined
      },
      invoiceDate: {
        column: undefined,
        parse: undefined
      }
    },
    options: {
      canadian_rebate: false,
      remove_null_rebates: false,
      additional_preprocessing: undefined,
      additional_postprocessing: undefined
    }
  }
}

interface ViewNewTransformerProps {
  group: string;
  name: string;
  type: "simple" | "advanced";
}

export const viewNewTransformer = createAsyncThunk(
  "system/viewNewTransformer",
  async (props: ViewNewTransformerProps, { getState, dispatch }): Promise<boolean> => {
    const state = getState() as RootState;
    const { group, name, type } = props;

    if (name === "") {
      dispatch(pushError("The transformer must have a name!"));
      return false;
    }

    const names = getTransformerNames(state);
    if (names.includes(name)) {
      dispatch(pushError("A transformer already has this name!"));
      return false;
    }

    let draft: TransformerDraft;

    switch (type) {
      case "simple":
        if (group === "") {
          dispatch(pushError("This transformer must have a group!"));
          return false;
        }

        draft = generateBasicDraft(name, group);
        break;
      case "advanced":
        draft = generateAdvancedDraft(name);
        break;
    }

    dispatch(setTransformerPage({ type: "create", draft }));
    return true;
  }
);

export const discardTransformerDraft = createAsyncThunk(
  "system/discardTransformerDraft",
  async (_, { getState, dispatch }): Promise<boolean> => {
    const state = getState() as RootState;
    const page = getTransformerPageInfo(state);
    
    switch(page.type) {
      case "create":
        dispatch(clearTransformerPage());
        return true;
      case "update":
        await dispatch(viewExistingTransformer(page.meta.name));
        return true;
      case "empty":
        return true;
    }
  }
)

export const saveTransformerDraft = createAsyncThunk(
  "system/saveTransformerDraft",
  async (_, { getState, dispatch }): Promise<boolean> => {
    const state = getState() as RootState;
    const page = getTransformerPageInfo(state);
    
    switch(page.type) {
      case "create": {
        const draft = getTransformerDraftAsData(state);
        if (!draft.ok) {
          dispatch(pushError(draft.reason));
          return false;
        }

        const created = await invoke.createTransformer(draft.data);
        if (!created.ok) {
          dispatch(pushError(created.reason));
          return false;
        }

        const { data: file } = created;
        await dispatch(pullTransformers());
        await dispatch(viewExistingTransformer(file.item.name));
      }  break;
      case "update": {
        const draft = getTransformerDraftAsData(state);
        if (!draft.ok) {
          dispatch(pushError(draft.reason));
          return false;
        }

        const updated = await invoke.updateTransformer({ data: draft, item: page.meta });
        if (!updated.ok) {
          dispatch(pushError(updated.reason));
          return false;
        }

        await dispatch(pullTransformers());
        await dispatch(viewExistingTransformer(page.meta.name));
      } break;
      case "empty":
        dispatch(pushError("No transformer draft found!"));
        break;
    }

    return true;
  }
)

export const deleteTransformerDraft = createAsyncThunk(
  "system/deleteTransformerDraft",
  async (_, { getState, dispatch }): Promise<void> => {
    const state = getState() as RootState;
    const page = getTransformerPageInfo(state);
    
    switch(page.type) {
      case "create":
        dispatch(clearTransformerPage());
        return;
      case "update": {
        const deleted = await invoke.deleteTransformer({ item: page.meta, data: bad("Blah!") });
        if (!deleted.ok) {
          dispatch(pushError(deleted.reason));
          return;
        }

        await dispatch(pullTransformers());
        dispatch(clearTransformerPage());
      } return;
      case "empty":
        dispatch(pushError("No transformer draft found!"));
        return;
    }
  }
);

/** ------------------------------------------------------------------------- */

export const addNewQuarter = createAsyncThunk(
  "system/addNewQuarter",
  async ({ createStructureFrom, quarter }: CreateQuarterOptions): Promise<Reply> => {
    return await invoke.createQuarter({ createStructureFrom, quarter });
  }
);

export const clearAllQuestions = createAsyncThunk(
  "system/clearAllQuestions",
  async (): Promise<Reply> => {
    return await invoke.clearQuestions({});
  }
);

export const doRefreshProgram = createAsyncThunk(
  "system/doRefreshProgram",
  async (): Promise<Reply> => {
    return await invoke.refreshProgram({});
  }
);

export const doPullAll = createAsyncThunk(
  "system/doPullAll",
  async (_, { dispatch }): Promise<void> => {
    await dispatch(pullSystemSettings());
    await dispatch(pullAllQuarters());
    await dispatch(pullQuestions());
    await dispatch(pullTransformers());
  }
);