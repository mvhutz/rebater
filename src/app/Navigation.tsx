import React from 'react';
import { Link } from 'react-router';

/** ------------------------------------------------------------------------- */

function Navigation() {
  return (
    <header>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/run">Run</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>
    </header>
  );
}

/** ------------------------------------------------------------------------- */

export default React.memo(Navigation);
