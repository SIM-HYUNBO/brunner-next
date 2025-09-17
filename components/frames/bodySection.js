`use strict`;
import React, { useEffect, useState } from "react";

export default function BodySection({ children, triggerMenuReload }) {
  // children에 triggerMenuReload를 내려주기 (필요하다면)
  return (
    <section className="m-2">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { triggerMenuReload })
          : child
      )}
    </section>
  );
}
