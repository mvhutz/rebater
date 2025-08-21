import React from 'react';
import Stack from '@mui/joy/Stack';
import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sheet, Typography } from '@mui/joy';
import TabMenu from '../../view/TabMenu';
import { useAppSelector } from '../../store/hooks';
import { getDisplayTab } from '../../store/slices/ui';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

/** ------------------------------------------------------------------------- */

const MARKDOWN_COMPONENTS: Components = {
  a({ node, href, ...rest }) {
    void [node];

    return <a href={href} target="_blank" {...rest} />
  }
};

const DOCUMENTATION_PAGE = `
# Documentation

You can learn more about this program [here](https://github.com/mvhutz/rebater#-rebater).
`;

/** ------------------------------------------------------------------------- */

function DocumentationTab() {
  const display = useAppSelector(getDisplayTab("documentation"));

  return (
    <Stack padding={0} display={display}>
      <TabMenu>
        <Typography level="body-lg" pt={0.5} color="neutral"><i>Documentation</i></Typography>
      </TabMenu>
      <Sheet sx={{ p: 5, overflow: "scroll" }}>
        <Markdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]} children={DOCUMENTATION_PAGE}/>
      </Sheet>
    </Stack>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(DocumentationTab);
