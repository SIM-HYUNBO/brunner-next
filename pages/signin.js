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
    var jLoginResult = RequestServer(
      `{"commandName": "security.login",
      "userId": "${userId}",
      "password": "${password}"
      }`).then((result) => {
        if(result.error_code==0){
          alert(`${userId}님 Bunner에 오신것을 환영합니다.`);
          router.push('/')  
        }else {
          alert(JSON.stringify(result.error_message));
        }
      });
   };

  return (
    <>
      <main className={cx(signinCss["form-signin"],"text-center","mt-5")}>
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
      </main>
    </>
  )
}