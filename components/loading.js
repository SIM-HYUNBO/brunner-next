`use strict`

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/30">
      <div className={`fixed 
                  top-0 
                  left-0 
                  w-full 
                  h-full 
                  flex 
                  items-center 
                  justify-center 
                  bg-gray-500 
                  bg-opacity-75 
                  z-50`}>
            <div className={`animate-spin 
                            rounded-full 
                            h-12 
                            w-12 
                            border-t-2 
                            border-b-2 
                            border-gray-900`}>
            </div>
      </div>
    </div>
  );
}

export default Loading;
