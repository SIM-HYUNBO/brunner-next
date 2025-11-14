`use strict`;

import React from "react";
import * as constants from "@/components/core/constants";

const GoverningMessage = ({
  governingMessage = constants.General.EmptyString,
}) => {
  const formattedMessage = governingMessage.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return <p>{formattedMessage}</p>;
};

export default GoverningMessage;
