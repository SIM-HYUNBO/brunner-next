import requestServer from './requestServer'
import { useRouter } from 'next/router'

export default function SignoutButton() {
  const router = useRouter();
  return (
    <>
      {process.env.userInfo && process.env.userInfo?.USER_NAME &&
        <button className="inline-flex items-center 
                                  boder-0 
                                  py-1 
                                  px-3 
                                  focus:outline-none 
                                bg-gray-100  
                                hover:bg-gray-50 
                                hover:text-orange-500
                                dark:bg-slate-600
                                dark:text-yellow-600 
                                dark:hover:text-yellow-300 
                                rounded text-base mt-4 md:mt-0"
          type="button"
          onClick={async () => {
            // alert(`${JSON.stringify(process.env.userInfo.USER_ID)}`);

            var jRequest = {};
            jRequest.commandName = "security.signout";
            jRequest.userId = process.env.userInfo?.USER_ID;

            var jResponse = await requestServer('POST', JSON.stringify(jRequest));
            if (jResponse.error_code == 0) {
              process.env.userInfo = jResponse.userInfo;
              localStorage.setItem('userInfo', JSON.stringify(process.env.userInfo));
              router.push('/')
            } else {
              alert(JSON.stringify(result.error_message));
            }
          }}>

          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </button>}
    </>
  );
}