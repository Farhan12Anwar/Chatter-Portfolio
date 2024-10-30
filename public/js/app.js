// /public/js/app.js

// const ProductListing = ({ products }) => (
//     <div className="product-listing">
//         <h2 className="text-center bg-primary text-white mt-3">CALL BOY'S</h2>
//         <div className="row row-cols-3">
//             {products.map((details, index) => (
//                 <div className="card mb-3" key={index}>
//                     <div className="card-header">
//                         <h3>{details.name}</h3>
//                     </div>
//                     <div className="card-body">
//                         <img src={details.photo} alt={details.name} width="200" height="200" />
//                     </div>
//                     <div className="card-footer">
//                         <h4>{details.price}</h4>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     </div>
// );

const Chat = () => {
    const [messages, setMessages] = React.useState([]);
    const [message, setMessage] = React.useState('');
    const [products, setProducts] = React.useState([]);

    React.useEffect(() => {
        // Fetch product data
        fetch('/api/products')
            .then(response => response.json())
            .then(data => setProducts(data));

        // Set up socket.io
        const socket = io();
        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // Clean up on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            const socket = io();
            socket.emit('chatMessage', message);
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            <ProductListing products={products} />
            <h2 className="text-center bg-secondary text-white">Live Chat</h2>
            <div className="message-list">
                {messages.map((msg, index) => (
                    <div key={index} className="alert alert-secondary">
                        {msg.username}: {msg.text}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    className="form-control"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button className="btn btn-primary mt-2" onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
};

const App = () => (
    <>
        <Chat />
    </>
);

ReactDOM.render(<App />, document.getElementById("app"));
