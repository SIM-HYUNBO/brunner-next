
import {useTheme} from 'next-themes'
import RequestServer from '../components/requestServer'
import { useRouter } from 'next/router'

export default function LogoutButton(){
    const router = useRouter();
    return (
        <>
            <button className="inline-flex items-center bg-gray-100 boder-0 py-1 px-3 focus:outline-none 
                               bg-gray-100  
                               hover:bg-gray-50 
                               hover:text-orange-500
                               dark:bg-slate-600
                               dark:text-yellow-600 
                               dark:hover:text-yellow-300 
                               rounded text-base mt-4 md:mt-0" display={process.env.userInfo == undefined || process.env.userInfo.USER_NAME == undefined ? 'none': 'block'}
            type="button"
            onClick={() => {
                RequestServer("GET",
                `{"commandName": "security.logout",
                  "userId": "${process.env.userInfo.userId}"}`)
                .then((result) => {
                  if(result.error_code==0){
                    process.env.userInfo=result.userInfo;
                    router.push('/')  
                  }else {
                    alert(JSON.stringify(result.error_message));
                  }
                });
            }}>
            </button>
        </>
    );
}