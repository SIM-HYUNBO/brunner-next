`use strict`

// import ClipsContentAnimation from './content-animation/contactContentAnimation'
import { useRouter } from 'next/router'
import DivContainer from "@/components/DivContainer"
import BrunnerVideo from '@/components/brunnerVideo'
import { isMobile, isTablet, isBrowser } from 'react-device-detect';

export default function ClipsContent() {
    const router = useRouter()

    return (
        <>
            <DivContainer className="mobile:flex-row desktop:flex-col">
                <div className="mobile:w-full desktop:w-1/2 items-start text-left">
                    <h2 className="title-font 
                       text-3xl 
                       mb-10 
                       font-medium 
                       text-green-900">
                        Videos that help life.
                    </h2>
                    <div className="main-governing-text">
                        The video clips that may be helpful in our life & mental training
                    </div>


                    <div className="flex">
                        <div className="w-full">
                            <BrunnerVideo
                                url={'https://youtu.be/MddvuCH-XUU'}
                                title={'S&P500 INDEX FUND'}
                                width="800px" // 100%
                                height="450px"// 100%
                                className="mt-5"
                            >
                            </BrunnerVideo>
                            <BrunnerVideo
                                url={'https://www.youtube.com/watch?v=5nRs1niZ9h4&list=PLqb1KKjbyLLjjsGoYF9KlogyNIF3KDo0Z'}
                                title={`The Advisors Alliance / 大军师司马懿之 军师联盟 (2017) / 대군사사마의지군사연맹`}
                                width="800px" // 100%
                                height="450px"// 100%
                                className="mt-5"
                            >
                            </BrunnerVideo>
                            <BrunnerVideo
                                url={'https://www.youtube.com/watch?v=UOmp8Zbvs7k&list=PLqb1KKjbyLLiVTGRO7cB_3PsbmbBRAvCj'}
                                title={`Growling Tiger, Roaring Dragon / 大军师司马懿之 虎啸龙吟 (2017) / 대군사사마의지호소용음`}
                                width="800px" // 100%
                                height="450px"
                                className="mt-5" // 100%
                            >
                            </BrunnerVideo>
                        </div>
                    </div>
                </div>
                {(!isMobile) && <div className="items-center">
                    {/* {<ClipsContentAnimation />} */}
                </div>}
            </DivContainer>
        </>
    );
}