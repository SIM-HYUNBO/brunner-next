`use strict`

const DivContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full relative ${className}`}>
      {children}
    </div>
  );
}

export default DivContainer;
