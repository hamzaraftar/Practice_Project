from .serializers import TodoSerializer
from .models import Todo

from rest_framework.views import APIView
from rest_framework.response import Response

class TodoAPI(APIView):
    def get(self,request,id=None):
        try:
            if id is not None:
                stu = Todo.objects.get(id=id)
                serializer = TodoSerializer(stu)
                return Response(serializer.data)
            
            stu = Todo.objects.all()
            serializer = TodoSerializer(stu, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({"error": str(e)})

    # for creating Todo
    def post(self,request):
        try:
            serializer = TodoSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors)
        except Exception as e:
            return Response({"error": str(e)})
    
    #  for updating using put request
    def put(self,request,id):
        try:
            stu = Todo.objects.get(id=id)
            serializer = TodoSerializer(stu, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors)
        except Exception as e:
            return Response({"error": str(e)})   
    # for updating using patch request
    def patch(self,request,id):
            try:
                stu = Todo.objects.get(id=id)
                serializer = TodoSerializer(stu, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors)
            except Exception as e:
                return Response({"error": str(e)})

    # for deleting Todo
    def delete(self,request,id):
        try:
            stu = Todo.objects.get(id=id)
            stu.delete()
            return Response({"message": "Todo deleted successfully"})
        except Exception as e:
            return Response({"error": str(e)})   