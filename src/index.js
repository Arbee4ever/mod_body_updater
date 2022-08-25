addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event).catch(
            (err) => new Response(err.stack, { status: 500 })
        )
    );
});

var data;

async function handleRequest(event) {
    let githubdata = await event.request.json();
    let modified = githubdata.head_commit.modified;
    if (modified.includes("README.md")) {
        let content = await fetch("https://raw.githubusercontent.com/Arbee4ever/" + githubdata.repository.name + "/" + githubdata.head_commit.id + "/README.md");
        data = {
            "body": await content.text()
        };
        let response = await fetch("https://api.modrinth.com/v2/project/" + githubdata.repository.name, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: MODRINTH_TOKEN,
                "User-Agent": "https://github.com/Arbee4ever/arbeeco.de (arbeeco.de)",
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            const message = {
                "content": null,
                "embeds": [
                    {
                        "title": "[" + githubdata.repository.name + "] Modrinth body updated!",
                        "url": githubdata.head_commit.url,
                        "description": data.body,
                        "color": 3191419,
                        "author": {
                            "name": githubdata.head_commit.author.name,
                            "url": "https://github.com/" + githubdata.head_commit.author.username,
                            "icon_url": "https://github.com/" + githubdata.head_commit.author.username + ".png"
                        }
                    }
                ],
                "attachments": []
            }
            let discordresponse = await fetch("https://discord.com/api/webhooks/1012268523583705098/xbVDY0nr5e3I7Npsepm7ZafrGVtAUQMWPjRV8Gst9s-Q2LbB-gR_qJo2FRmSlJK7vMcy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: MODRINTH_TOKEN,
                    "User-Agent": "https://github.com/Arbee4ever/arbeeco.de (arbeeco.de)",
                },
                body: JSON.stringify(message)
            });
            return new Response("Success! " + await response.text());
        } else {
            return new Response(await response.text())
        }
    }
    return new Response("Commit didn't modify README.md or description.");
}