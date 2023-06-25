import SignoutButton from "./signout-button";
import DarkModeToggleButton from "./dark-mode-toggle-button";

export default function UserInfo(){

  const userName = ()=>{
    return typeof process.env.userInfo == "undefined" || 
    typeof process.env.userInfo.USER_NAME == "undefined" ? 
    '': process.env.userInfo.USER_NAME +'님';
  }

    // userInfo : 현재값 가져오기 getter
    // setUserInfo : 현재값 바꾸기 setter
    return (
        <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400 align-middle">
          <DarkModeToggleButton />
          <p className="mr-1 ml-1">
            {userName()}
          </p>
          <SignoutButton />
        </div>
    );
}