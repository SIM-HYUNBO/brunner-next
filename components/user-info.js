import SignoutButton from "./signout-button";
import { useState } from 'react'

export default function UserInfo(){

  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    setUserInfo(process.env.userInfo)
  }, [process.env.userInfo]);  

    // userInfo : 현재값 가져오기 getter
    // setUserInfo : 현재값 바꾸기 setter
    return (
        <>
          <p className="ml-3 mr-1 text-gray-600 dark:text-gray-400">
            {userInfo === undefined || userInfo.USER_NAME === undefined ? '': `${userInfo.USER_NAME}님`}
          </p>
          <SignoutButton />
        </>
    );
}