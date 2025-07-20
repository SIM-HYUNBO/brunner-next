`use strict`

const DivContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full relative my-10 ${className}`}>
      {children}
    </div>
  );
}

export default DivContainer;
