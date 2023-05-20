import cx from 'classnames';
import signinCss from './_app';
import RequestServer from '../components/requestServer'
import { useRouter } from 'next/router'

export default function Signin() {
  const router = useRouter();

  var userId='';
  const changeUserId = (e) => {
    userId = e.target.value
  };
  
  var password='';
  const changePassword = (e) => {
    password = e.target.value
  };
    
  var requestLoginResult=()=> {
    RequestServer("GET",
      `{"commandName": "security.login",
        "userId": "${userId}",
        "password": "${password}"}`)
      .then((result) => {
        if(result.error_code==0){
          process.env.userInfo=result.userInfo;
          console.log(JSON.stringify(process.env.userInfo));
          router.push('/')  
        }else {
          alert(JSON.stringify(result.error_message));
        }
      });
   };

  return (

    <>
    <section class="text-gray-600 body-font">
      <div class="container px-5 py-24 mx-auto flex flex-wrap items-center">
        <div class="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
          <h1 class="title-font font-medium text-3xl text-gray-900">Log in to the Brunner system... </h1>
          <p class="leading-relaxed mt-4">Enter your ID and password.</p>
        </div>
        <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h2 class="text-gray-900 text-lg font-medium title-font mb-5">Sign In</h2>
          <div class="relative mb-4">
            <label for="id" class="leading-7 text-sm text-gray-600">ID</label>
            <input type="text" id="id" name="Id" onChange={(e) => changeUserId(e)} class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
          </div>
          <div class="relative mb-4">
            <label for="password" class="leading-7 text-sm text-gray-600">Password</label>
            <input type="password" id="password" name="password" 
                   class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                   onChange={(e) => changePassword(e)}></input>
          </div>
          <button onClick={()=>requestLoginResult()} class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Login</button>
          <p class="text-xs text-gray-500 mt-3">Nice to meet you.</p>
        </div>
      </div>
    </section>  

      {/* <main className={cx(signinCss["form-signin"],"text-center","mt-5")}>
        <form>
          <h1 className="leading-relaxed mb-8">Brunner에 로그인 합니다.</h1>

          <div className="form-floating">
            <input type="text" className="form-control text-center" id="floatingInput" placeholder="brunner ID"  onChange={(e) => changeUserId(e)}/>
            <label htmlFor="leading-relaxed mb-8">ID를 입력하세요.</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control text-center" id="floatingPassword" placeholder="Password"  onChange={(e) => changePassword(e)}/>
            <label htmlFor="leading-relaxed mb-8">Password를 입력하세요.</label>
          </div>

          <div className={cx(signinCss.checkbox,"mb-3")}>
            <label>
              <input type="checkbox" value="remember-me" /> Remember me
            </label>
          </div>
          <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg m-2" 
                  type="button"
                  onClick={()=>requestLoginResult()}>Sign in
          </button>
        </form>
      </main> */}
    </>
  )
}