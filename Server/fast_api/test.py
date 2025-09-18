import uvicorn

if __name__ == "__main__":
    uvicorn.run(app="Server.fast_api.resources:app", host="0.0.0.0", port=8080, reload=True)
