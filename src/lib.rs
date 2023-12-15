use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Node {
    tag_name: String,
    attributes: HashMap<String, String>,
    children: Vec<Node>,
}

impl std::hash::Hash for Node {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.tag_name.hash(state);
        self.attributes.iter().for_each(|(k, v)| {
            k.hash(state);
            v.hash(state);
        });
        self.children.hash(state);
    }
}

impl Node {
    pub fn new(tag_name: String, attributes: HashMap<String, String>, children: Vec<Node>) -> Node {
        Node {
            tag_name,
            attributes,
            children,
        }
    }

    pub fn merge(&mut self, other: &mut Node) {
        let mut seen = HashMap::new();
        self.dfs(&mut seen);
        other.dfs(&mut seen);
    }

    fn dfs(&mut self, seen: &mut HashMap<Node, bool>) {
        if !seen.contains_key(self) {
            seen.insert(self.clone(), true);
            for child in &mut self.children {
                child.dfs(seen);
            }
        }
    }
}
