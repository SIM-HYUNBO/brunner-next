`use strict`

const DivContainer = ({ children, className = "" }) => {
  return (
    <div className={`container ${className}`}>
      {children}
    </div>
  );
}

export default DivContainer;
