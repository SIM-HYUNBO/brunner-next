`use strict`
import React, { useEffect, useState } from "react";

export default function BodySection({ children, triggerLeftMenuReload }) {
  // children에 triggerLeftMenuReload를 내려주기 (필요하다면)
  return (
    <section className="my-2">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { triggerLeftMenuReload })
          : child
      )}
    </section>
  );
}