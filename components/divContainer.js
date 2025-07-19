`use strict`

const DivContainer = ({ children, className = "" }) => {
  return (
    <div className={`w-full px-4 md:container md:px-0 relative ${className}`}>
      {children}
    </div>
  );
}

export default DivContainer;
