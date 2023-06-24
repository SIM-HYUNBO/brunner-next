import SignoutButton from "./signout-button";

export default function UserInfo(){

  const userName = ()=>{
    return typeof process.env.userInfo == "undefined" || 
    typeof process.env.userInfo.USER_NAME == "undefined" ? 
    '': process.env.userInfo.USER_NAME;
  }

    // userInfo : 현재값 가져오기 getter
    // setUserInfo : 현재값 바꾸기 setter
    return (
        <>
        {
         <p className="ml-3 mr-1 text-gray-600 dark:text-gray-400">
            `{userName()}님`
          </p>
        }
          <SignoutButton />
        </>
    );
}