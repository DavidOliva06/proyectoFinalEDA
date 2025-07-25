
class Node:
    def __init__(self, key):
        self.key = int(key)
        self.left = None
        self.right = None

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
        root = insert(root, value) 
    return root

# --- Rotaciones para Splay ---
def right_rotate(x):
    y = x.left
    x.left = y.right
    y.right = x
    return y

def left_rotate(x):
    y = x.right
    x.right = y.left
    y.left = x
    return y

# --- Algoritmos Principales del Splay ---

def splay(root, key):
    """La operación clave: trae el nodo con la 'key' a la raíz."""
    if not root or root.key == key: return root

    if key < root.key:
        # La clave no está en el árbol, terminamos
        if not root.left: return root
        # Zig-Zig (Izquierda-Izquierda)
        if key < root.left.key:
            root.left.left = splay(root.left.left, key)
            root = right_rotate(root)
        # Zig-Zag (Izquierda-Derecha)
        elif key > root.left.key:
            root.left.right = splay(root.left.right, key)
            if root.left.right:
                root.left = left_rotate(root.left)
        # Zig (Izquierda)
        return right_rotate(root) if root.left else root
    else: # key > root.key
        # La clave no está en el árbol, terminamos
        if not root.right: return root
        # Zig-Zag (Derecha-Izquierda)
        if key < root.right.key:
            root.right.left = splay(root.right.left, key)
            if root.right.left:
                root.right = right_rotate(root.right)
        # Zig-Zig (Derecha-Derecha)
        elif key > root.right.key:
            root.right.right = splay(root.right.right, key)
            root = left_rotate(root)
        # Zig (Derecha)
        return left_rotate(root) if root.right else root

def search(root, key):
    """En un árbol Splay, la búsqueda es simplemente un splay."""
    return splay(root, key)

def insert(root, key):
    """Inserta la clave y la convierte en la nueva raíz."""
    if not root: return Node(key)
    
    # Splay acerca la clave (o su padre) a la raíz
    root = splay(root, key)
    
    # Si la clave ya existe, no hacemos nada
    if root.key == key: return root

    new_node = Node(key)
    if key < root.key:
        new_node.right = root
        new_node.left = root.left
        root.left = None
    else:
        new_node.left = root
        new_node.right = root.right
        root.right = None
    return new_node

def delete(root, key):
    """Elimina la clave, haciendo que su sucesor o predecesor sea la nueva raíz."""
    if not root: return None
    
    # Trae el nodo a eliminar a la raíz
    root = splay(root, key)
    
    if key != root.key: # La clave no estaba en el árbol
        return root

    # Si lo encontramos, lo eliminamos y unimos los dos subárboles
    if not root.left:
        return root.right
    else:
        new_root = root.left
        # Hacemos splay del elemento más grande del subárbol izquierdo a la raíz
        new_root = splay(new_root, key)
        new_root.right = root.right
        return new_root