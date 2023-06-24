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
        <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400 align-middle">
          <DarkModeToggleButton />
          <p >
            {userName()}님
          </p>
          <SignoutButton />
        </div>
    );
}