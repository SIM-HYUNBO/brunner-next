`use strict`

const DivContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full relative my-16 ${className}`}>
      {children}
    </div>
  );
}

export default DivContainer;
