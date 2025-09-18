LOGIN_SECRET="alkdfjaksljdf_123^&%&"
SERVER_URL="http://127.0.0.1:8080"

from autogen_ext.runtimes.grpc import GrpcWorkerAgentRuntime
runtime_closure = GrpcWorkerAgentRuntime(host_address="localhost:50051")

import asyncio
result_queue = asyncio.Queue()