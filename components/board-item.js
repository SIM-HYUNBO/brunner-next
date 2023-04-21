export default function BoardItem({data}){
    return (
        <div className="p-6 m-3 bg-slate-400 rounded-md">
            <h1>{data.properties.제목.title[0].plain_text} : {data.properties.게시일.date.start}</h1>
        </div>
    )
}