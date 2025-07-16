import React from 'react';
import Stack from '@mui/joy/Stack';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Option, Select, Sheet } from '@mui/joy';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Documents from './Documents';
import TabMenu from '../../TabMenu';
import path from 'path-browserify';
import { useAppSelector } from '../../../../../client/store/hooks';
import { getDisplayTab } from '../../../../../client/store/slices/ui';

/** ------------------------------------------------------------------------- */

const MARKDOWN_COMPONENTS: Components = {
  a({ node, href, ...rest }) {
    void [node];
    return <Link to={path.join("..", href ?? "/")} {...rest} />
  }
};

function DocumentationTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const display = useAppSelector(getDisplayTab("documentation"));

  const handleChangeDoc = React.useCallback((_: unknown, doc: Maybe<string>) => {
    navigate(doc ?? "/");
  }, [navigate]);

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Select value={location.pathname} onChange={handleChangeDoc} renderValue={e => <><i>Reading:</i>&nbsp;{e?.label}</>} variant="plain" indicator={<ExpandMoreRoundedIcon fontSize="small" />}>
          {Documents.map(d => (
            <Option value={d.id} key={d.id}>{d.name}</Option>
          ))}
        </Select>
      </TabMenu>
      <Sheet sx={{ p: 5 }}>
        <Routes>
          {Documents.map(d => (
            <Route index={d.name === "Welcome"} path={d.id} element={<Markdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]} children={d.text} />}/>
          ))}
        </Routes>

      </Sheet>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DocumentationTab);
