class Node:
    def __init__(self, key):
        self.key = int(key)
        self.left = None
        self.right = None
        self.height = 1 # Un nuevo nodo siempre tiene altura 1

# Las funciones tree_to_dict y dict_to_tree son casi idénticas a las del BST.
# dict_to_tree reconstruirá el árbol usando nuestra lógica de inserción de AVL.
def tree_to_dict(node, highlight_key=None):
    if not node: return None
    node_dict = {"name": f"{node.key} (h:{node.height})", "original_name": str(node.key)}
    if highlight_key is not None and node.key == highlight_key:
        node_dict["highlighted"] = True
    children = []
    if node.left: children.append(tree_to_dict(node.left, highlight_key))
    if node.right: children.append(tree_to_dict(node.right, highlight_key))
    if children: node_dict["children"] = children
    return node_dict

def dict_to_tree(data):
    def get_values(node_dict):
        if not node_dict: return []
        values = [int(node_dict.get('original_name', node_dict['name'].split(' ')[0]))]
        if 'children' in node_dict:
            for child in node_dict['children']: values.extend(get_values(child))
        return values
    values = get_values(data)
    root = None
    for value in values: root = insert(root, value)
    return root

# --- Funciones Auxiliares del AVL ---

def get_height(root):
    return root.height if root else 0

def get_balance(root):
    return get_height(root.left) - get_height(root.right) if root else 0

def right_rotate(y):
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    return x

def left_rotate(x):
    y = x.right
    T2 = y.left
    y.left = x
    x.right = T2
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    return y

# --- Algoritmos Principales del AVL ---

def insert(root, key):
    # 1. Inserción estándar de BST
    if not root: return Node(key)
    if key < root.key:
        root.left = insert(root.left, key)
    elif key > root.key:
        root.right = insert(root.right, key)
    else:
        return root # Claves duplicadas no se permiten

    # 2. Actualizar altura y obtener factor de equilibrio
    root.height = 1 + max(get_height(root.left), get_height(root.right))
    balance = get_balance(root)

    # 3. Re-balancear si es necesario (4 casos)
    # Caso Izquierda-Izquierda
    if balance > 1 and key < root.left.key:
        return right_rotate(root)
    # Caso Derecha-Derecha
    if balance < -1 and key > root.right.key:
        return left_rotate(root)
    # Caso Izquierda-Derecha
    if balance > 1 and key > root.left.key:
        root.left = left_rotate(root.left)
        return right_rotate(root)
    # Caso Derecha-Izquierda
    if balance < -1 and key < root.right.key:
        root.right = right_rotate(root.right)
        return left_rotate(root)
        
    return root

def delete(root, key):
    # (La lógica de borrado de AVL sigue un patrón similar: borrado de BST y luego re-balanceo)
    # Es bastante largo, así que lo dejaremos aquí como una implementación completa.
    if not root: return root
    # Lógica de búsqueda del nodo
    if key < root.key: root.left = delete(root.left, key)
    elif key > root.key: root.right = delete(root.right, key)
    else: # Nodo encontrado
        if not root.left: return root.right
        elif not root.right: return root.left
        temp = root.right
        while temp.left: temp = temp.left
        root.key = temp.key
        root.right = delete(root.right, temp.key)
    
    if not root: return root # El árbol puede quedar vacío

    # Actualizar altura y re-balancear
    root.height = 1 + max(get_height(root.left), get_height(root.right))
    balance = get_balance(root)

    # Re-balanceo
    if balance > 1: # Desbalanceado a la izquierda
        if get_balance(root.left) >= 0: return right_rotate(root) # Caso Izq-Izq
        else: # Caso Izq-Der
            root.left = left_rotate(root.left)
            return right_rotate(root)
    if balance < -1: # Desbalanceado a la derecha
        if get_balance(root.right) <= 0: return left_rotate(root) # Caso Der-Der
        else: # Caso Der-Izq
            root.right = right_rotate(root.right)
            return left_rotate(root)

    return root

def search(root, key):
    # La búsqueda es idéntica a la del BST
    if root is None or root.key == key: return root
    if key < root.key: return search(root.left, key)
    return search(root.right, key)