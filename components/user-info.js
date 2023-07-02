import SignoutButton from "./signout-button";
import DarkModeToggleButton from "./dark-mode-toggle-button";

export default function UserInfo(){

  const userName = ()=>{
    const userName = process.env.userInfo?.USER_NAME;

    return (userName === undefined ? '': process.env.userInfo.USER_NAME +'님');
  }

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