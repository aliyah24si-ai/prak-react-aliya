export default function FlexboxGrid(){
    return (
<nav className="flex justify-between bg-gradient-to-r from-teal-400 to-cyan-500 p-4 text-white">        <h1 className="text-lg font-bold">MyWebsite</h1>
         <ul className="flex space-x-4">
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    )
}