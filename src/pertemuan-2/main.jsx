import { createRoot } from "react-dom/client";
import './custom.css'; 
import HelloWorld from "./HelloWorld";
import QuoteText from "./QuoteText";
import Container from "./Container";


createRoot(document.getElementById("root"))
    .render(
        <div>
            <Container>
                 <img src="img/gambar1.jpg" alt="Gambar 1" width="20%" />
              <HelloWorld/>
               <QuoteText/>
            </Container>
          
        </div>
        
    )
   