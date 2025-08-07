import React from 'react';
import Stack from '@mui/joy/Stack';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sheet, Typography } from '@mui/joy';
import TabMenu from '../../TabMenu';
import { useAppSelector } from '../../../../../client/store/hooks';
import { getDisplayTab } from '../../../../../client/store/slices/ui';
import { HashLink } from 'react-router-hash-link';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import path from 'path-browserify';

/** ------------------------------------------------------------------------- */

const MARKDOWN_COMPONENTS: Components = {
  a({ node, href, ...rest }) {
    void [node];

    return <HashLink scroll={e => e.scrollIntoView({ "behavior": "smooth", block: 'center'})} to={href?.[0] === "#" ? href : path.join("..", href ?? "/")} {...rest} />
  }
};

/** ------------------------------------------------------------------------- */

function DocumentationTab() {
  const display = useAppSelector(getDisplayTab("documentation"));

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Documentation</i></Typography>
      </TabMenu>
      <Sheet sx={{ p: 5, overflow: "scroll" }}>
        <Markdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}>
          # Documentation

          You can learn more about this program [here](https://github.com/mvhutz/rebater#-rebater)
        </Markdown>
      </Sheet>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DocumentationTab);
