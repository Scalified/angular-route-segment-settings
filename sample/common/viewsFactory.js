function ViewsFactory($routingSettings) {
    var result = $routingSettings.getMappedValue('templateUrl');
    return result;
}
