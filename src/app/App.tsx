import React from 'react';

/** ------------------------------------------------------------------------- */

function App() {
  const { invoke } = window.api;

  React.useEffect(() => {
    document.title = "Rebater — Fuse Alliance Rebate Processor";
  });

  const handleDirectory = React.useCallback(async () => {
    const response = await invoke.chooseDir();
    alert(response);
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
