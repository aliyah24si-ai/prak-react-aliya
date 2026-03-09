export default function HelloWorld(){
    
        const propsUserCard = {
        nama: "Goku 🐷",
        nim: "999999",
        tanggal: "2025-01-01"
    }



    return (
        <div>
            <h1>Hello World</h1>
            <p>Selamat Belajar ReactJs</p>
            <GreetingBinjai/>
            {/* <QuoteText/> */}

             <UserCard 
	            nama="alea 🐣" 
	            nim="2457301010"
	            tanggal={new Date().toLocaleDateString()}
	          />
             <UserCard 
	            nama="shofi 🐔" 
	            nim="2457301130"
	            tanggal= "01/01/25"
	          />

                < UserCard {...propsUserCard} />
               
        </div>
    )
}


function GreetingBinjai(){
    return (
            <small>Salam dari Binjai 🤩</small>
    )
}

function UserCard(props){
    return (
        <div>
            <hr/>
            <h3>Nama: {props.nama}</h3>
            <p>NIM: {props.nim}</p>
            <p>Tanggal: {props.tanggal}</p>
        </div>
    )
}