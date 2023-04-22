export default function BoardItem({data}){
    const startDate=data.properties.게시일.date.start;
    const writer=data.properties.게시자.rich_text[0].plain_text;
    const content=data.properties.내용.rich_text[0].plain_text;;
    const category=data.properties.분류.rich_text[0].plain_text;;
    const title=data.properties.제목.title[0].plain_text;
    const tags=data.properties.태그.multi_select.map(tagItem=>(tagItem.name));

    return (
        <div className="p-6 m-3 bg-slate-600 rounded-md">
            <h1>{title}</h1>
            <hr></hr>
            <h1>{content}</h1>
            <hr></hr>
            <h1>분류: {category}</h1>
            <hr></hr>
            <h1>영역:[{tags.join(',')}]</h1>
            <hr></hr>
            <h1>게시자: {writer}</h1>
            <hr></hr>
            <h1>게시일: {startDate.substring(0, 10)}</h1>
        </div>
    )
}