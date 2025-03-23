`use strict`

import React from 'react';

const GoverningMessage = ({ governingMessage }) => {
    const formattedMessage = governingMessage.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  
    return <p>{formattedMessage}</p>;
  };
  
  export default GoverningMessage;