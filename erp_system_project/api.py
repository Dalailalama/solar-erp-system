from ninja import NinjaAPI
from accounts.api import router as accounts_router

api = NinjaAPI()

api.add_router("/accounts/", accounts_router)

@api.get("/hello")
def hello(request):
    return {"message": "Hello from Django Ninja!"}
