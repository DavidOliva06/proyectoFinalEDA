from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Tree

# Serializer para el registro de nuevos usuarios
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # Usamos create_user para hashear la contraseña correctamente. [8]
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# Serializer para mostrar la información del usuario (sin datos sensibles)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


# Serializer para el modelo Tree
class TreeSerializer(serializers.ModelSerializer):
    # Mostramos el username del propietario, pero es de solo lectura.
    # El usuario se asignará automáticamente desde la vista.
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Tree
        # Campos que se incluirán en la API
        fields = ('id', 'user', 'name', 'tree_type', 'structure', 'created_at', 'updated_at')
        # Campos que no se pueden editar directamente a través de la API
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')