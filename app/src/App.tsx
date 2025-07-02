import React from 'react';

/** ------------------------------------------------------------------------- */

function App() {
  const { invoke, handle } = window.api;

  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  const handleDirectory = React.useCallback(async () => {
    invoke.getPing('ping');
    handle.getPong();
  }, [])

  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={handleDirectory}>Pick Directory</button>
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(App);
