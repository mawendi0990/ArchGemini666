import httpx

class HTTPClientManager:
    client: httpx.AsyncClient = None

    @classmethod
    def get_client(cls) -> httpx.AsyncClient:
        if cls.client is None:
            # Initialize with reasonable limits
            limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)
            cls.client = httpx.AsyncClient(limits=limits, timeout=60.0)
        return cls.client

    @classmethod
    async def close(cls):
        if cls.client:
            await cls.client.aclose()
            cls.client = None

http_client = HTTPClientManager
