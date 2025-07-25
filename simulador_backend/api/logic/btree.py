

# --- Estructura de Clases del Árbol B ---
class BTreeNode:
    def __init__(self, leaf=False):
        self.leaf = leaf
        self.keys = []
        self.children = []

class BTree:
    def __init__(self, t):
        self.root = BTreeNode(leaf=True)
        self.t = t # Grado mínimo

    def search(self, key, node=None):
        # (Implementación sin cambios)
        node = node if node is not None else self.root
        i = 0
        while i < len(node.keys) and key > node.keys[i]: i += 1
        if i < len(node.keys) and key == node.keys[i]: return (node, i)
        elif node.leaf: return None
        else: return self.search(key, node.children[i])

    def insert(self, key):
        # (Implementación sin cambios)
        root = self.root
        if len(root.keys) == (2 * self.t) - 1:
            new_root = BTreeNode()
            self.root = new_root
            new_root.children.insert(0, root)
            self._split_child(new_root, 0)
            self._insert_non_full(new_root, key)
        else:
            self._insert_non_full(self.root, key)

    def _insert_non_full(self, node, key):
        # (Implementación sin cambios)
        i = len(node.keys) - 1
        if node.leaf:
            node.keys.append(0)
            while i >= 0 and key < node.keys[i]:
                node.keys[i + 1] = node.keys[i]
                i -= 1
            node.keys[i + 1] = key
        else:
            while i >= 0 and key < node.keys[i]: i -= 1
            i += 1
            if len(node.children[i].keys) == (2 * self.t) - 1:
                self._split_child(node, i)
                if key > node.keys[i]: i += 1
            self._insert_non_full(node.children[i], key)
    
    def _split_child(self, parent_node, child_index):
        # (Implementación sin cambios)
        t = self.t
        full_child = parent_node.children[child_index]
        new_node = BTreeNode(leaf=full_child.leaf)
        parent_node.keys.insert(child_index, full_child.keys[t - 1])
        parent_node.children.insert(child_index + 1, new_node)
        new_node.keys = full_child.keys[t:]
        full_child.keys = full_child.keys[0:t - 1]
        if not full_child.leaf:
            new_node.children = full_child.children[t:]
            full_child.children = full_child.children[0:t]

    # --- NUEVA LÓGICA DE BORRADO ---
    def delete(self, key, node=None):
        if node is None: node = self.root
        
        self._delete_recursive(node, key)

        # Si la raíz queda vacía y no es una hoja, la reemplazamos por su único hijo
        if len(self.root.keys) == 0 and not self.root.leaf:
            self.root = self.root.children[0]

    def _delete_recursive(self, node, key):
        t = self.t
        i = 0
        while i < len(node.keys) and key > node.keys[i]: i += 1

        # CASO 1: La clave está en un nodo hoja
        if node.leaf:
            if i < len(node.keys) and node.keys[i] == key:
                node.keys.pop(i)
            return

        # CASO 2: La clave está en un nodo interno
        if i < len(node.keys) and node.keys[i] == key:
            # CASO 2a: El hijo izquierdo tiene al menos 't' claves
            if len(node.children[i].keys) >= t:
                predecessor = self._find_predecessor(node.children[i])
                node.keys[i] = predecessor
                self._delete_recursive(node.children[i], predecessor)
            # CASO 2b: El hijo derecho tiene al menos 't' claves
            elif len(node.children[i+1].keys) >= t:
                successor = self._find_successor(node.children[i+1])
                node.keys[i] = successor
                self._delete_recursive(node.children[i+1], successor)
            # CASO 2c: Ambos hijos tienen 't-1' claves -> Fusionar
            else:
                self._merge_children(node, i)
                self._delete_recursive(node.children[i], key)
            return

        # CASO 3: La clave no está aquí, hay que descender.
        # Primero, asegurar que el hijo al que bajamos tenga al menos 't' claves.
        child_node = node.children[i]
        if len(child_node.keys) == t - 1:
            # CASO 3a: Tomar prestado del hermano izquierdo
            if i > 0 and len(node.children[i-1].keys) >= t:
                self._borrow_from_prev(node, i)
            # CASO 3a: Tomar prestado del hermano derecho
            elif i < len(node.keys) and len(node.children[i+1].keys) >= t:
                self._borrow_from_next(node, i)
            # CASO 3b: Fusionar
            else:
                if i < len(node.keys):
                    self._merge_children(node, i)
                else: # El hijo es el último, fusionar con el anterior
                    self._merge_children(node, i - 1)
                    i -= 1 # Apuntar al nuevo nodo fusionado
            child_node = node.children[i]
        
        self._delete_recursive(child_node, key)

    def _find_predecessor(self, node):
        # El predecesor es la clave más a la derecha en el subárbol
        while not node.leaf:
            node = node.children[-1]
        return node.keys[-1]

    def _find_successor(self, node):
        # El sucesor es la clave más a la izquierda en el subárbol
        while not node.leaf:
            node = node.children[0]
        return node.keys[0]

    def _borrow_from_prev(self, parent_node, child_index):
        child = parent_node.children[child_index]
        sibling = parent_node.children[child_index - 1]
        
        # Mover clave del padre al hijo
        child.keys.insert(0, parent_node.keys[child_index - 1])
        # Mover clave del hermano al padre
        parent_node.keys[child_index - 1] = sibling.keys.pop()
        
        # Mover hijo del hermano al hijo
        if not sibling.leaf:
            child.children.insert(0, sibling.children.pop())

    def _borrow_from_next(self, parent_node, child_index):
        child = parent_node.children[child_index]
        sibling = parent_node.children[child_index + 1]

        child.keys.append(parent_node.keys[child_index])
        parent_node.keys[child_index] = sibling.keys.pop(0)

        if not sibling.leaf:
            child.children.append(sibling.children.pop(0))

    def _merge_children(self, parent_node, child_index):
        child = parent_node.children[child_index]
        sibling = parent_node.children[child_index + 1]

        # Bajar clave del padre y juntarla con las claves del hijo
        child.keys.append(parent_node.keys.pop(child_index))
        # Mover todas las claves y hijos del hermano al hijo
        child.keys.extend(sibling.keys)
        child.children.extend(sibling.children)
        
        # Eliminar al hermano del padre
        parent_node.children.pop(child_index + 1)


# --- Interfaz Pública para la API ---

def tree_to_dict(btree_node, highlight_key=None): # Sin cambios
    if not btree_node: return None
    key_str = ", ".join(map(str, btree_node.keys))
    node_dict = {"name": f"[{key_str}]"}
    if highlight_key is not None and highlight_key in btree_node.keys:
        node_dict["highlighted"] = True
    if not btree_node.leaf:
        node_dict["children"] = [tree_to_dict(child, highlight_key) for child in btree_node.children]
    return node_dict

def dict_to_tree(data, t=2): # Sin cambios
    def get_values(node_dict):
        if not node_dict: return []
        keys_str = node_dict['name'].strip('[]').replace(' ', '')
        if not keys_str: return []
        values = [int(k) for k in keys_str.split(',')]
        if 'children' in node_dict:
            for child in node_dict['children']: values.extend(get_values(child))
        return values
    values = get_values(data)
    btree = BTree(t)
    for v in sorted(values): btree.insert(v)
    return btree.root

def insert(root_node, key, t=2): # Sin cambios
    btree = BTree(t)
    if root_node and root_node.keys: btree.root = root_node
    btree.insert(key)
    return btree.root

def search(root_node, key, t=2): # Sin cambios
    if not root_node or not root_node.keys: return None
    btree = BTree(t)
    btree.root = root_node
    return btree.search(key)

def delete(root_node, key, t=2):
    if not root_node or not root_node.keys: return root_node
    btree = BTree(t)
    btree.root = root_node
    btree.delete(key)
    return btree.root