use futures_util::{FutureExt, StreamExt};
use warp::Filter;

#[tokio::main]
async fn main() {
    let port = 8080;

    let client = warp::fs::dir("./client");

    let websocket = warp::path::end().and(warp::ws()).map(|ws: warp::ws::Ws| {
        // And then our closure will be called when it completes...
        ws.on_upgrade( |websocket| {
            // Just echo all messages back...
            let (tx, rx) = websocket.split();
            
            while let Some(result) = rx.next().await {
                let msg = match result {
                    Ok(msg) => msg,
                    Err(e) => {
                        break;
                    }
                };
            }

            rx.forward(tx).map(|result| {
                if let Err(e) = result {
                    eprintln!("websocket error: {:?}", e);
                }
            })
        })
    });

    let routes = warp::get()
        .and(client
            .or(websocket)
        );

    println!("Server started on port ws://127.0.0.1:{port}");
    println!("Client started on port http://127.0.0.1:{port}/client");

    warp::serve(routes).run(([127, 0, 0, 1], port)).await;
}
