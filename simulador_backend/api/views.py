#RECURSOS DE DJANGO
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
#RECURSOS DE api/
from .models import Tree
from .serializers import UserRegistrationSerializer, TreeSerializer
from .permissions import IsOwner  # Crearemos este permiso personalizado
#RECURSOS DE api/logic/
from .logic import bst, avl, splay, btree

# --- Vistas de Autenticación ---

class UserRegistrationView(generics.CreateAPIView):
    """
    Endpoint público para que nuevos usuarios se registren.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny] # Cualquiera puede registrarse


# --- Vistas de la Lógica Principal ---

class TreeViewSet(viewsets.ModelViewSet):
    """
    Un ViewSet para ver, crear, editar y eliminar árboles.
    Provee las URLs estándar de un CRUD:
    - GET /api/trees/ (Listar todos los árboles del usuario)
    - POST /api/trees/ (Crear un nuevo árbol)
    - GET /api/trees/{id}/ (Obtener un árbol específico)
    - PUT /api/trees/{id}/ (Actualizar un árbol)
    - DELETE /api/trees/{id}/ (Eliminar un árbol)
    """
    serializer_class = TreeSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        """
        Esta vista solo debe devolver los árboles pertenecientes
        al usuario autenticado que realiza la petición.
        """
        return Tree.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario autenticado al crear un nuevo árbol.
        No es necesario enviar el 'user_id' desde el frontend.
        """
        serializer.save(user=self.request.user)
    
    def _get_logic_module(self, tree_type):
        """
        Función auxiliar para seleccionar el módulo de lógica correcto
        basado en el 'tree_type' del objeto Tree.
        Esta es la pieza clave que hace que nuestro ViewSet sea genérico.
        """
        if tree_type == Tree.TreeTypes.BST:
            return bst
        elif tree_type == Tree.TreeTypes.AVL:
            return avl
        elif tree_type == Tree.TreeTypes.SPLAY:
            return splay
        elif tree_type == Tree.TreeTypes.B_TREE:
            return btree
        return None

    @action(detail=True, methods=['post'], url_path='operate')
    def operate_on_tree(self, request, pk=None):
        """
        Endpoint único para manejar inserción, eliminación y búsqueda.
        URL: POST /api/trees/{id}/operate/
        Espera un cuerpo de petición como: { "operation": "insert", "value": 50 }
        """
        tree = self.get_object() # Obtiene el árbol por su pk y verifica permisos
        operation = request.data.get('operation')
        value_str = request.data.get('value')
        
        # Validación de la entrada
        if not operation or value_str is None:
            return Response(
                {"error": "Se requieren 'operation' (insert/delete/search) y 'value'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            value = int(value_str)
        except (ValueError, TypeError):
            return Response({"error": "El 'value' debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Seleccionar el módulo de lógica (bst, avl, etc.)
        logic = self._get_logic_module(tree.tree_type)
        if not logic:
            return Response(
                {"error": f"Lógica para el tipo de árbol '{tree.tree_type}' no implementada."},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
            
        # 2. Proceso: JSON -> Objeto Árbol en Memoria
        # Reconstruimos el árbol desde su representación JSON en la BBDD
        root_node = logic.dict_to_tree(tree.structure)
        
        highlight_key = None # Para la operación de búsqueda

        # 3. Ejecutar la operación lógica
        if operation == 'insert':
            root_node = logic.insert(root_node, value)
        elif operation == 'delete':
            root_node = logic.delete(root_node, value)
        elif operation == 'search':
            # La búsqueda en Splay modifica el árbol. Para otros, no.
            # Nuestro diseño lo maneja de forma transparente.
            search_result = logic.search(root_node, value)
            
            # En Splay, search devuelve la nueva raíz, así que la actualizamos.
            if tree.tree_type == Tree.TreeTypes.SPLAY:
                root_node = search_result

            if search_result: # Si no es None, la clave fue encontrada
                highlight_key = value
        else:
            return Response({"error": "Operación no válida. Use 'insert', 'delete' o 'search'."}, status=status.HTTP_400_BAD_REQUEST)
            
        # 4. Proceso: Objeto Árbol en Memoria -> JSON
        # Convertimos el árbol modificado de vuelta a un diccionario JSON
        new_structure = logic.tree_to_dict(root_node, highlight_key=highlight_key)
        
        # 5. Guardar y responder
        tree.structure = new_structure
        tree.save()
        
        serializer = self.get_serializer(tree)
        return Response(serializer.data, status=status.HTTP_200_OK)