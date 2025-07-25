# api/models.py

from django.db import models
from django.contrib.auth.models import User

class Tree(models.Model):
    """
    Representa un árbol de datos guardado por un usuario.
    """

    # --- Opciones para el tipo de árbol ---
    class TreeTypes(models.TextChoices):
        BST = 'BST', 'Árbol Binario de Búsqueda'
        AVL = 'AVL', 'Árbol AVL'
        SPLAY = 'SPLAY', 'Árbol Splay'
        B_TREE = 'B_TREE', 'Árbol B'

    # --- Relaciones ---
    # Cada árbol pertenece a un único usuario.
    # Si el usuario es eliminado, todos sus árboles se eliminan en cascada.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trees')

    # --- Campos del Modelo ---
    # Nombre que el usuario le da a su árbol para identificarlo.
    name = models.CharField(max_length=100, help_text="Nombre personalizado para el árbol")

    # Tipo de árbol para saber qué lógica aplicar.
    # Usamos `choices` para restringir los valores a los definidos en TreeTypes. [7, 9]
    tree_type = models.CharField(
        max_length=10,
        choices=TreeTypes.choices,
        default=TreeTypes.BST
    )

    # El corazón del modelo. Almacenamos la estructura completa del árbol como JSON.
    # Esto es ideal para la visualización en el frontend con n3.js/D3.js. [1, 6]
    # `default=dict` asegura que el campo sea un objeto JSON vacío por defecto.
    structure = models.JSONField(
        default=dict,
        help_text="Estructura del árbol en formato JSON para visualización"
    )

    # --- Timestamps ---
    # Guarda la fecha y hora de creación automáticamente la primera vez. [4, 5, 14]
    created_at = models.DateTimeField(auto_now_add=True)
    # Guarda la fecha y hora de la última modificación cada vez que se guarda. [4, 5, 12]
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        """
        Representación en texto del objeto, útil para el panel de admin de Django.
        """
        return f"'{self.name}' ({self.get_tree_type_display()}) - Usuario: {self.user.username}"
    class Meta:
        # Asegura que un usuario no pueda tener dos árboles con el mismo nombre.
        unique_together = ('user', 'name')
        # Ordena los árboles por fecha de modificación descendente por defecto.
        ordering = ['-updated_at']
