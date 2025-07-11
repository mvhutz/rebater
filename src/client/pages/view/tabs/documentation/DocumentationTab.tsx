import React from 'react';
import Stack from '@mui/joy/Stack';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import Dropdown from '@mui/joy/Dropdown';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { getVisible, toggleSettings, toggleTabs } from '../../../../store/slices/ui';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Option, Select, Sheet } from '@mui/joy';
import { Link, useNavigate, useParams } from 'react-router';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Documents from './Documents';
import path from 'path-browserify';

/** ------------------------------------------------------------------------- */

const MARKDOWN_COMPONENTS: Components = {
  a({node, href, ...rest }) {
    void [node];
    return <Link to={path.join("/documentation", href ?? "")} {...rest} />
  }
};

function DocumentationTab() {
  const { tabs: show_tabs, settings: show_settings } = useAppSelector(getVisible);
  const { doc = "" } = useParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const handleToggleTabs = React.useCallback(() => {
    dispatch(toggleTabs());
  }, [dispatch]);

  const handleToggleSettings = React.useCallback(() => {
    dispatch(toggleSettings());
  }, [dispatch]);

  const handleChangeTab = React.useCallback((_: unknown, tab: Maybe<string>) => {
    navigate(`/documentation/${tab}`);
  }, [navigate]);

  const { text = "" } = Documents.find(d => d.id === doc) ?? {};
  
  return (
    <Stack padding={0}>
      <Stack padding={1}>
        <Stack direction="row" justifyContent="center" alignItems="center" position="relative">
          <Stack>
            <Select value={doc} onChange={handleChangeTab} renderValue={e => <><i>Reading:</i>&nbsp;{e?.label}</>}variant="plain" indicator={<ExpandMoreRoundedIcon fontSize="small"/>}>
              {Documents.map(d => (
                <Option value={d.id} key={d.id}>{d.name}</Option>
              ))}
            </Select>
          </Stack>
          <Dropdown>
            <MenuButton sx={{ position: "absolute", right: 0, top: 0 }}
              slots={{ root: IconButton }}
              slotProps={{ "root": { variant: 'plain', color: 'neutral' } }}
            ><MoreVertRoundedIcon /></MenuButton>
            <Menu size='sm' placement="bottom-end">
              <MenuItem onClick={handleToggleTabs}>{show_tabs ? "Hide" : "Show"} Tabs</MenuItem>
              <MenuItem onClick={handleToggleSettings}>{show_settings ? "Hide" : "Show"} Settings</MenuItem>
            </Menu>
          </Dropdown>
        </Stack>
      </Stack>
      <Sheet sx={{ p: 5 }}>
        <Markdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]} children={text} />
      </Sheet>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DocumentationTab);
