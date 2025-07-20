`use strict`

const DivContainer = ({ children, className = "" }) => {
  return (
<<<<<<< HEAD
    <div className={`w-full relative ${className}`}>
=======
    <div className={`w-full relative my-10 ${className}`}>
>>>>>>> parent of 971250a (레이아웃 정리 끝)
      {children}
    </div>
  );
}

export default DivContainer;
