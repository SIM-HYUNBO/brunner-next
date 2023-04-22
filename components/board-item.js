export default function BoardItem({data}){
    const startDate=data.properties.게시일.date.start;
    const writer=data.properties.게시자.rich_text[0].plain_text;
    const content=data.properties.내용;
    const category=data.properties.분류;
    const title=data.properties.제목.title[0].plain_text;
    const tag=data.properties.태그;

    return (
        <div className="p-6 m-3 bg-slate-400 rounded-md">
            <h1>{startDate} : </h1>
            <h1>{writer} : </h1>
            <h1>{content} : </h1>
            <h1>{category} : </h1>
            <h1>{title} : </h1>
            <h1>{tag} : </h1>
        </div>
    )
}