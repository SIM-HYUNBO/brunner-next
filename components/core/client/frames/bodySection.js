`use strict`;
import React, { useEffect, useState } from "react";

export default function BodySection({ children }) {
  return (
    <section className="m-0">
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child) : child
      )}
    </section>
  );
}
