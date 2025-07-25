from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los propietarios de un objeto editarlo.
    """
    def has_object_permission(self, request, view, obj):
        # Los permisos de lectura están permitidos para cualquier solicitud,
        # por lo que siempre permitiremos las solicitudes GET, HEAD o OPTIONS.
        # if request.method in permissions.SAFE_METHODS:
        #     return True  # Descomenta esta línea si quieres que otros vean tus árboles

        # El permiso de escritura solo se concede al propietario del árbol.
        return obj.user == request.user