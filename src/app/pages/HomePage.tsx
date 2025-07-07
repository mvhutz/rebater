import React from 'react';

/** ------------------------------------------------------------------------- */

function RunPage() {
  const [running, setRunning] = React.useState(false);

  return (
    <div>
      <h1>Welcome to Rebater!</h1>
      <p>
        This UI is a WIP.
      </p>
    </div>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(RunPage);
