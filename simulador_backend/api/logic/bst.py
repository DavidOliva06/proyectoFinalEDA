# Objeto simple para representar un nodo en el árbol.
class Node:
    def __init__(self, key):
        self.key = int(key) # Nos aseguramos de que la clave sea un entero
        self.left = None
        self.right = None

# --- TRADUCTORES: JSON <-> ÁRBOL DE NODOS ---

def tree_to_dict(node, highlight_key=None):
    """
    Convierte recursivamente un árbol de nodos a un diccionario D3.js/n3.js-friendly.
    Formato: {"name": "valor", "children": [...]}
    Añade una bandera 'highlighted' si la clave coincide con highlight_key.
    """
    if node is None:
        return None

    node_dict = {"name": str(node.key)}
    
    # Si esta es la clave que estamos buscando, la marcamos para el frontend.
    if highlight_key is not None and node.key == highlight_key:
        node_dict["highlighted"] = True

    children = []
    if node.left:
        children.append(tree_to_dict(node.left, highlight_key))
    if node.right:
        children.append(tree_to_dict(node.right, highlight_key))
        
    if children:
        node_dict["children"] = children
        
    return node_dict

def dict_to_tree(data):
    """
    Convierte un diccionario (proveniente de JSON) a un árbol de nodos.
    Esta función es más simple: solo inserta los valores uno por uno
    para reconstruir el árbol BST y asegurar su integridad.
    """
    
    def get_values(node_dict):
        """Extrae todos los valores de la estructura de diccionario."""
        if not node_dict:
            return []
        values = [int(node_dict['name'])]
        if 'children' in node_dict:
            for child in node_dict['children']:
                values.extend(get_values(child))
        return values

    values = get_values(data)
    root = None
    for value in values:
        root = insert(root, value) # Reutilizamos nuestra propia lógica de inserción
    return root


# --- ALGORITMOS PRINCIPALES DEL BST ---

def insert(root, key):
    """
    Inserta una nueva clave en el BST. Devuelve la nueva raíz del árbol.
    """
    if root is None:
        return Node(key)
    
    if key < root.key:
        root.left = insert(root.left, key)
    elif key > root.key:
        root.right = insert(root.right, key)
        
    return root

def search(root, key):
    """
    Busca una clave en el BST. Devuelve el nodo si lo encuentra, si no None.
    """
    if root is None or root.key == key:
        return root
    
    if key < root.key:
        return search(root.left, key)
    
    return search(root.right, key)

def delete(root, key):
    """
    Elimina una clave del BST. Devuelve la nueva raíz del árbol.
    """
    if not root:
        return root

    # Buscamos el nodo a eliminar
    if key < root.key:
        root.left = delete(root.left, key)
    elif key > root.key:
        root.right = delete(root.right, key)
    else:
        # Caso 1: El nodo tiene un hijo o ninguno
        if not root.left:
            return root.right
        elif not root.right:
            return root.left

        # Caso 2: El nodo tiene dos hijos
        # Encontramos el sucesor in-order (el menor en el subárbol derecho)
        temp = root.right
        while temp.left:
            temp = temp.left
        
        root.key = temp.key # Copiamos el valor del sucesor
        root.right = delete(root.right, temp.key) # Eliminamos el sucesor

    return root